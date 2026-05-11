#!/usr/bin/env python3
import argparse
import re
import sqlite3
from pathlib import Path


INSERT_RE = re.compile(
    r"INSERT INTO\s+`(?P<table>[^`]+)`\s+\((?P<columns>.*?)\)\s+VALUES\s*(?P<values>.*)",
    re.DOTALL,
)


def sqlite_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def decode_mysql_string(token: str) -> str:
    assert token[0] == "'" and token[-1] == "'"
    inner = token[1:-1]
    result = []
    i = 0
    while i < len(inner):
        char = inner[i]
        if char != "\\":
            result.append(char)
            i += 1
            continue

        i += 1
        if i >= len(inner):
            result.append("\\")
            break

        escaped = inner[i]
        result.append(
            {
                "0": "\0",
                "b": "\b",
                "n": "\n",
                "r": "\r",
                "t": "\t",
                "Z": chr(26),
                "'": "'",
                '"': '"',
                "\\": "\\",
            }.get(escaped, escaped)
        )
        i += 1

    return "".join(result)


def transform_scalar(token: str) -> str:
    token = token.strip()
    if not token:
      return "NULL"
    if token.upper() == "NULL":
        return "NULL"
    if token.startswith("'") and token.endswith("'"):
        return sqlite_quote(decode_mysql_string(token))
    if token.startswith("0x") and len(token) > 2:
        return f"X'{token[2:]}'"
    return token


def parse_values_block(values_block: str):
    rows = []
    i = 0
    length = len(values_block)

    while i < length:
        while i < length and values_block[i] in " \t\r\n,":
            i += 1
        if i >= length:
            break
        if values_block[i] != "(":
            raise ValueError(f"Expected '(' at position {i}")

        i += 1
        row = []
        while i < length:
            while i < length and values_block[i] in " \t\r\n":
                i += 1

            if i >= length:
                raise ValueError("Unexpected end of values block")

            if values_block[i] == "'":
                start = i
                i += 1
                while i < length:
                    current = values_block[i]
                    if current == "\\":
                        i += 2
                        continue
                    if current == "'":
                        i += 1
                        break
                    i += 1
                token = values_block[start:i]
            else:
                start = i
                while i < length and values_block[i] not in ",)":
                    i += 1
                token = values_block[start:i]

            row.append(transform_scalar(token))

            while i < length and values_block[i] in " \t\r\n":
                i += 1

            if i >= length:
                raise ValueError("Unexpected end after value")

            if values_block[i] == ",":
                i += 1
                continue

            if values_block[i] == ")":
                i += 1
                break

            raise ValueError(f"Unexpected character {values_block[i]!r} at {i}")

        rows.append("(" + ", ".join(row) + ")")

    return rows


def extract_insert_statements(sql_text: str):
    statements = []
    i = 0
    marker = "INSERT INTO `"
    while True:
        start = sql_text.find(marker, i)
        if start == -1:
            break

        in_string = False
        escaped = False
        pos = start
        while pos < len(sql_text):
            char = sql_text[pos]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == "'":
                    in_string = False
            else:
                if char == "'":
                    in_string = True
                elif char == ";":
                    statements.append(sql_text[start:pos].strip())
                    i = pos + 1
                    break
            pos += 1
        else:
            statements.append(sql_text[start:].strip())
            break

    return statements


def normalize_datetime_columns(connection: sqlite3.Connection):
    tables = [
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT IN ('sqlite_sequence')"
        ).fetchall()
    ]

    for table in tables:
        columns = connection.execute(f'PRAGMA table_info("{table}")').fetchall()
        datetime_columns = [col[1] for col in columns if (col[2] or "").upper() == "DATETIME"]

        for column in datetime_columns:
            connection.execute(
                f'''
                UPDATE "{table}"
                SET "{column}" = CASE
                    WHEN "{column}" GLOB '????-??-?? ??:??:??' THEN replace("{column}", ' ', 'T') || '.000Z'
                    WHEN "{column}" GLOB '????-??-?? ??:??:??.*' THEN replace("{column}", ' ', 'T') || 'Z'
                    ELSE "{column}"
                END
                WHERE "{column}" IS NOT NULL
                '''
            )

    connection.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dump", required=True)
    parser.add_argument("--sqlite", required=True)
    args = parser.parse_args()

    dump_path = Path(args.dump)
    sqlite_path = Path(args.sqlite)

    sql_text = dump_path.read_text(encoding="utf-8", errors="ignore")
    insert_statements = extract_insert_statements(sql_text)

    connection = sqlite3.connect(sqlite_path)
    connection.execute("PRAGMA foreign_keys = OFF")

    sqlite_tables = {
        row[0]
        for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table'"
        ).fetchall()
    }
    sqlite_tables.discard("sqlite_sequence")

    for table in sorted(sqlite_tables):
        connection.execute(f'DELETE FROM "{table}"')
    connection.execute("DELETE FROM sqlite_sequence")
    connection.commit()

    inserted_rows = 0
    inserted_tables = set()

    for statement in insert_statements:
        match = INSERT_RE.match(statement)
        if not match:
            continue

        table = match.group("table")
        if table not in sqlite_tables:
            continue

        columns = [f'"{col}"' for col in re.findall(r"`([^`]+)`", match.group("columns"))]
        values = parse_values_block(match.group("values"))

        sql = (
            f'INSERT INTO "{table}" ({", ".join(columns)}) VALUES\n'
            + ",\n".join(values)
        )
        connection.execute("BEGIN")
        connection.executescript(sql + ";")
        connection.commit()

        inserted_rows += len(values)
        inserted_tables.add(table)
        print(f"Imported {table}: {len(values)} rows")

    normalize_datetime_columns(connection)
    connection.execute("PRAGMA foreign_keys = ON")
    connection.commit()
    connection.close()

    print(f"Done. Tables imported: {len(inserted_tables)}. Rows imported: {inserted_rows}.")


if __name__ == "__main__":
    main()
