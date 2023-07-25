import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      created_at: string;
      session_id: string;
    };
    meal: {
      id: string;
      name: string;
      description: string;
      created_at: string;
      user_meal_id: string;
    };
  }
}
