exports.up = knex => knex.schema.createTable("users", table => {
    table.increments("id")
    table.varchar("name")
    table.varchar("email")
    table.varchar("password")
    table.varchar("avatar")
    table.timestamp("created_at").default(knex.fn.now())
    table.timestamp("updated_at").default(knex.fn.now())
});


exports.down = knex => knex.schema.dropTable("users")

