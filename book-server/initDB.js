const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Create Books table
    db.run(`
        CREATE TABLE IF NOT EXISTS Books (
            book_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            isbn TEXT,
            publication_date TEXT,
            price REAL,
            description TEXT,
            publisher TEXT,
            page_count INTEGER,
            language TEXT,
            format TEXT,
            stock_quantity INTEGER,
            cover_image_url TEXT,
            rating REAL,
            FOREIGN KEY (author_id) REFERENCES Authors(author_id),
            FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        )
    `);

    // Create Author table
    db.run(`
        CREATE TABLE IF NOT EXISTS Authors (
            author_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            biography TEXT,
            date_of_birth TEXT,
            nationality TEXT,
            photo_url TEXT
        )
    `);

    // Create Category table
    db.run(`
        CREATE TABLE IF NOT EXISTS Categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    `);

    // Create User table
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            first_name TEXT,
            last_name TEXT,
            date_of_birth TEXT,
            address TEXT,
            phone_number TEXT
        )
    `);

    // Create Order table
    db.run(`
        CREATE TABLE IF NOT EXISTS \`Orders\` (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_date TEXT,
            total_amount REAL,
            status TEXT,
            shipping_address TEXT,
            billing_address TEXT,
            payment_method TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `);

    // Create OrderItem table
    db.run(`
        CREATE TABLE IF NOT EXISTS OrderItems (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            book_id INTEGER,
            quantity INTEGER,
            unit_price REAL,
            total_price REAL,
            FOREIGN KEY (order_id) REFERENCES \`Orders\`(order_id),
            FOREIGN KEY (book_id) REFERENCES Books(book_id)
        )
    `);

    console.log("Database initialized.");
});

db.close();