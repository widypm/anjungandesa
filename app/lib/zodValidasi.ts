import { Step } from "app/types";
import { z, ZodTypeAny, ZodObject } from "zod";

export function generateZodSchema(sections: Step[]) {
  const shape: Record<string, ZodTypeAny> = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      let zodType: ZodTypeAny;

      switch (field.type) {
        case "text":
          zodType = z.union([z.string(), z.number()]).optional();
          if (field.required) {
            zodType = zodType.refine(
              (val) =>
                val === undefined ||
                (typeof val === "string" && val.trim() !== "") ||
                (typeof val === "number" && !isNaN(val)),
              { message: `${field.label} is required` }
            );
          }
          break;

        case "switch":
          zodType = z.boolean().optional();
          break;

        case "hide":
          zodType = z.string().optional();
          break;

        default:
          zodType = z.any().optional();
          break;
      }

      shape[field.name] = zodType;
    });
  });

  // schema jadi ZodObject
  return z.object(shape).partial();
}

export function validateWithZod(schema: ZodTypeAny, data: any) {
  // pastikan schema = ZodObject
  if (!(schema instanceof z.ZodObject)) {
    throw new Error("Schema must be a ZodObject");
  }

  const zodObj = schema as ZodObject<any>;

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // pick hanya field yang ada di item
      const mask = Object.keys(item).reduce((acc, key) => {
        if (key in zodObj.shape) {
          acc[key] = true;
        }
        return acc;
      }, {} as Record<string, true>);

      const dynamicSchema = zodObj.pick(mask);
      const parsedResult = dynamicSchema.safeParse(item);
      if (!parsedResult.success) {
        const messages = parsedResult.error.issues
          .map((issue) => issue.message)
          .join(", ");
        return { success: false, error: messages, index: i };
      }
    }
    return { success: true, data };
  }

  // single object
  const dynamicSchema = zodObj.pick(
    Object.keys(data ?? {}).reduce((acc, key) => {
      if (key in zodObj.shape) {
        acc[key] = true;
      }
      return acc;
    }, {} as Record<string, true>)
  );
  const parsedResult = dynamicSchema.safeParse(data);

  if (!parsedResult.success) {
    const messages = parsedResult.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: messages };
  }

  return { success: true, data: parsedResult.data };
}
