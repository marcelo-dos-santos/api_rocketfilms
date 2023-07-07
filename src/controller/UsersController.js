const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError")
const {hash, compare} = require("bcryptjs");


class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;

        const database = await sqliteConnection()

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])
        if(checkUserExists) {
            throw new AppError("Este e-mail já está em uso!")
        }

        const hashedPassword = await hash(password, 8)

        await database.run("INSERT INTO users (name, email, password) VALUES(?, ?, ?)", [name, email, hashedPassword])

        const responseData = {
            message: "Usuário criado com sucesso!",
            user: {
                name,
                email,
            }
        };

        return response.status(201).json(responseData)
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;
    
        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = ?", [user_id]);
    
        if (!user) {
            throw new AppError("Usuário não encontrado");
        }
    
        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = ? AND id <> ?", [email, user_id]);
    
        if (userWithUpdatedEmail) {
            throw new AppError("Este e-mail já está em uso.");
        }
    
        user.name = name || user.name;
        user.email = email || user.email;
    
        if (password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir a nova senha");
        }
    
        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);
    
            if (!checkOldPassword) {
                throw new AppError("A senha antiga não confere.");
            }
    
            user.password = await hash(password, 8);
        }
    
        await database.run(`
            UPDATE users SET 
            name = ?, 
            email = ?, 
            password = ?,
            updated_at = DATETIME('now') 
            WHERE id = ?`, 
            [user.name, user.email, user.password, user.id]);
    
        const updatedUser = await database.get("SELECT * FROM users WHERE id = ?", [user.id]);
    
        const responseData = {
            message: "Dados alterados com sucesso!",
            user: {
                name: updatedUser.name,
                email: updatedUser.email
            }
        };
    
        response.json(responseData);
    }

    async delete(request, response) {
        const { id } = request.params;
        
        const database = await sqliteConnection();

        await database.run("DELETE FROM users WHERE id = ?", [id]);

        const responseData = {
            message: "Usuário deletado com sucesso!",
        };

        response.json(responseData)
    }
}

module.exports = UsersController;