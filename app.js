// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

app.use(bodyParser.json());

// Serve other static files
app.use(express.static('public'));
app.get('/style.css', (req, res) => {
    const styleFilePath = path.join(__dirname,'style.css');
    res.sendFile(styleFilePath);
});

app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve fonts from 'Fonts' directory
app.use('/fonts', express.static(path.join(__dirname, 'Fonts')));

app.get('/', (req, res) => {
    const htmlFilePath = path.join(__dirname, 'home.html');
    res.sendFile(htmlFilePath);
});

app.get('/order.js', (req, res) => {
    const scriptFilePath = path.join(__dirname,'order.js');
    res.sendFile(scriptFilePath);
});
app.use('/setting.json', express.static (path.join(__dirname,'setting.json')))
app.use('/config.json', express.static (path.join(__dirname,'config.json')))
app.put('/update-setting', async (req, res) => {
    try {
        // Get the updated user data from the request body
        const userEmail = req.body['user'];
        const updatedUserData= req.body['data']
        console.log(userEmail,updatedUserData)
        // Load the setting data from the setting.json file
        const settingFilePath = path.join(__dirname, 'setting.json');
        const settingData = JSON.parse(await fs.readFile(settingFilePath));
        
        // Extract user data from updatedUserData
        
        // Update the setting data with the updated user data
        const existingUserIndex = settingData.user.findIndex(obj => obj[userEmail]);
        if (existingUserIndex !== -1) {
            // User exists, update the user data
            settingData.user[existingUserIndex][userEmail] = updatedUserData;
        } else {
            // User doesn't exist, create a new user entry
            settingData.user.push({ [userEmail]: updatedUserData });
        }
        
        // Write the updated setting data back to the setting.json file
        await fs.writeFile(settingFilePath, JSON.stringify(settingData, null, 2));
        
        // Respond with a success message
        res.json({ message: 'setting.json updated successfully' });
    } catch (error) {
        console.error('Error updating setting.json:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
