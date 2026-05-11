import { HeaderTable } from "../types";

export function buildSearchFilter(
  searchParams: URLSearchParams,
  columns: HeaderTable[]
): any[] {
  const whereConditions: any[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    const col = columns.find((c) => c.key === key);
    if (!col) continue;
    // Case 1: column pakai joinSearch
    if (col.join && col.joinSearch) {
      // Deep clone object joinSearch dan replace "value"
      const condition = JSON.parse(JSON.stringify(col.joinSearch));

      // Helper recursive untuk replace semua "contains": "value" jadi contains: value (dari URL)
      function replaceValue(obj: any): any {
        for (const k in obj) {
          if (typeof obj[k] === "object" && obj[k] !== null) {
            replaceValue(obj[k]);
          } else {
            if (k === "contains") {
              obj[k] = value;
            }
          }
        }
        return obj;
      }

      whereConditions.push(replaceValue(condition));
      continue;
    }
    switch (col.type) {
      case "text":
        if (key === "roleName") {
          // nested relation example
          whereConditions.push({
            role: {
              name: {
                contains: value,
              },
            },
          });
        } else {
          whereConditions.push({
            [key]: {
              contains: value,
            },
          });
        }
        break;

      case "boolean":
        whereConditions.push({
          [key]: value === "true",
        });
        break;

      case "number":
        whereConditions.push({
          [key]: parseFloat(value),
        });
        break;

      case "date":
        whereConditions.push({
          [key]: new Date(value),
        });
        break;

      default:
        break;
    }
  }

  return whereConditions;
}
