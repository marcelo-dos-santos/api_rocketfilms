const knex = require("../database/knex");
const AppError = require("../utils/AppError")

class NotesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const user_id  = request.user.id;

        if(rating > 5) {
            throw new AppError("Rating superior a 5! Tem que ser de 0 a 5")
        }

        if(rating < 0) {
            throw new AppError("Rating inferior a 0! tem que ser de 0 a 5")
        }

        const [note_id] = await knex("movie_notes").insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                name,
                user_id
            }
        });

        await knex("tags").insert(tagsInsert)

        const responseData = {
            message: "A nota foi criada com sucesso!",
            note: {
                title,
                description,
                note_id,
                rating,
                tags
            }
        };

        response.json(responseData);
    }

    async show(request, response) {
        const {id} = request.params;

        const note = await knex("movie_notes").where({id}).first();
        const tags = await knex("tags").where({note_id: id}).orderBy("name");
        
        return response.json({
            ...note,
            tags,
        });
    }

    async delete(request, response) {
        const { id } = request.params;

        const note = await knex("movie_notes").select("title").where({ id }).first();

        await knex("movie_notes").where({ id }).delete();

        const responseData = {
            message: "A nota foi deletada com sucesso!",
            deletedNote: {
                title: note.title
            }
        };

        return response.json(responseData);
    }

    async index(request, response) {
        const { title, user_id, tags } = request.query;

        let notes;

        if(tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());

            notes = await knex("tags")
            .select([
                "movie_notes.id",
                "movie_notes.title",
                "movie_notes.user_id",
            ])
            .where("movie_notes.user_id", user_id)
            .whereLike("movie_notes.title", `%${title}%`)
            .whereIn("name", filterTags)
            .innerJoin("movie_notes", "movie_notes.id", "tags.note_id")
            .orderBy("movie_notes.title")
        } else {
            notes = await knex("movie_notes")
            .where({ user_id })
            .whereLike("title", `%${title}%`)
            .orderBy("title");
        }

        const userTags = await knex("tags").where({ user_id });
        const notesWithTags = notes.map(note => {
            const noteTags = userTags.filter(tag => tag.note_id === note.id);

            return {
                ...note,
                tags: noteTags
            }
        })

        return response.json(notesWithTags);
    }
}


module.exports = NotesController;