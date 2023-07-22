import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table
      .uuid("user_meal_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .after("id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meal", (table) => {
    table.dropColumn("user_meal_id");
  });
}
