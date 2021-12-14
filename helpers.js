
const generateRandomString = (length) => {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const findUser = (email, userDatabase) => {
    for(const user in userDatabase) {
        if(email === userDatabase[user].email) {
            return userDatabase[user];
        }
    }
    return undefined;
};

const urlsForUser = (id, loggedInUser, urlDatabase) => {
    const urlFiltered = {};
    if(id === loggedInUser) {
        for(const url in urlDatabase) {
            if(urlDatabase[url]['userID'] === id) {
                urlFiltered[url] = urlDatabase[url];
            }
        }
        return urlFiltered;
    } else { 
        return undefined;
    }
};

module.exports = { generateRandomString, findUser, urlsForUser };