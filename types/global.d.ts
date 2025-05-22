import mongoose, { Connection } from "mongoose";

declare global {
  // Only if not already defined
  var mongoose:
    | {
        conn: Connection | null;
        promise: Promise<Connection> | null;
      }
    | undefined;
}
