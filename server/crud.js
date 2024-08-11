import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno desde .env.template

async function main() {
    const uri = process.env.MONGODB_URI;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();

        const database = client.db('test');  // Cambia 'test' por el nombre de tu base de datos
        const collection = database.collection('users');  // Cambia 'users' por el nombre de tu colección

        const doc = {
            username: "ccordova",
            email: "carlos.cordova@epn.edu.ec",
            password: "ccordova",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(doc);

        console.log(`Documento insertado con el ID: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

