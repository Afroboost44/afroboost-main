const { query } = require("express");

exports.getUsers = async (req, res, query) => {
    console.log("React to get Users");
    try {
        const users = await query("SELECT * FROM users ORDER BY date_joined DESC");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteUser = async (req, res, query) => {
    console.log("yaha tk to aah gay hain sir")
    try {
        const userId = req.params.id;
        await query("DELETE FROM users WHERE id = ?", [userId]);
        await query("DELETE from messages where user_id=?", [userId])
        await query("DELETE from library where user_id=?", [userId])
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.deleteMessage = async (req, res, query) => {

    try {
        const messageId = req.params.id;
        console.log("Message delete end point")
        await query("DELETE FROM messages WHERE id = ?", [messageId]);
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
