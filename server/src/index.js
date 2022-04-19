import express from 'express';
import cors from 'cors';
const app = express();
import { StreamChat } from 'stream-chat';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

app.use(cors());
app.use(express.json());

const apiKey = 'z8r55cya3tz4';
const apiSecret = '4jjfpgp76rwmp298r7bnb9x55krs6pkewf9yu98c4r2knatzgxber8k2z76cxyed';
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

app.post('/signup', async (req, res) => {

    try {
        const { firstName, lastName, username, password } = req.body;
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createToken(userId);

        return res.json({ token, userId, username, firstName, lastName, hashedPassword });
    } catch (error) {
        return res.json(error);
    }

});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { users } = await serverClient.queryUsers({name: username});

        if (users.length === 0) {
            return res.json({ message: 'User not found' });
        }

        const token = serverClient.createToken(users[0].id);
        const passwordMatch = await bcrypt.compare(password, users[0].hashedPassword);

        if (passwordMatch) {
            res.json({ token, firstName: users[0].firstName, lastName: users[0].lastName, username, userId: users[0].id });
        } else {
            res.json({ message: 'Invalid password' });
        }
    } catch (err) {
        res.json(err);
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
})