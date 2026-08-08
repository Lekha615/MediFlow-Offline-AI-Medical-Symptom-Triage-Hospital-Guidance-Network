import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";

type RequestSource = "body" | "query" | "params";

/**
 * Validates a request source (body/query/params) against a Zod schema.
 * On success, the source is replaced with the parsed & coerced data so
 * downstream controllers can trust the shape/types.
 * On failure, responds 422 with field-level error messages.
 */
export const validate = (
  schema: ZodType,
  source: RequestSource = "body"
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join(".") || source,
          message: issue.message,
        })),
      });
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      // req.query / req.params may not be directly re-assignable in all
      // Express versions, so we mutate the existing object instead.
      Object.assign(req[source] as object, result.data as object);
    }

    next();
  };
};
