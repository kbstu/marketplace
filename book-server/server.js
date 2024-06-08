const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Initialize the Database

const db = new sqlite3.Database('./database.sqlite');

const JWT_SECRET = 'secret_key';

// Routes

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('Token is required');
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
};

// BOOKS:

// Get All Books
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM Books', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message});
            return;
        } 
        res.json(rows);
    });
});


// Get Book from Id
app.get('/api/books/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM Books WHERE book_id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message});
            return;
        }
        res.json(row);
    });
})

// Post Book to Database
app.post('/api/books', (req, res) => {
    const { title, author_id, category_id, isbn, publication_date, price, description, publisher, page_count, language, format, stock_quantity, cover_image_url, rating } = req.body;
    const sql = 'INSERT INTO Books (title, author_id, category_id, isbn, publication_date, price, description, publisher, page_count, language, format, stock_quantity, cover_image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [title, author_id, category_id, isbn, publication_date, price, description, publisher, page_count, language, format, stock_quantity, cover_image_url, rating];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ updatedID: this.changes });
    });
});

// Update Book in Database


// Delete Book from Database
app.delete('api/books/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM Books WHERE book_id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deletedID: this.changes });
    });
});

// Update Stock Count in Database
app.put('/api/books/:id/stock', (req, res) => {
    const { id } = req.params;
    const { count } = req.body;

    if (!Number.isInteger(count) || count < 0) {
        return res.status(400).json({ error: 'Invalid stock count' });
    }

    const sql = 'UPDATE Books SET stock_quantity = ? WHERE book_id = ?';
    const params = [count, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error updating stock count:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Stock count updated successfully', book_id: id, stock_quantity: count });
    });
});

// USERS:

// Fetch Users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM Users', (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Update User by ID
// Update User by ID
app.put('/api/users/:id', (req, res) => {
	const { id } = req.params;
	const { email, password, first_name, last_name, date_of_birth, address, phone_number } = req.body;
	const sql = `
		UPDATE Users 
		SET email = ?, password = ?, first_name = ?, last_name = ?, date_of_birth = ?, address = ?, phone_number = ? 
		WHERE user_id = ?
	`;
	const params = [email, password, first_name, last_name, date_of_birth, address, phone_number, id];

	db.run(sql, params, function (err) {
		if (err) {
		console.error('Error updating user:', err);
		res.status(500).json({ error: 'Internal server error' });
		return;
		}
		res.json({ user_id: id, email, first_name, last_name, date_of_birth, address, phone_number });
	});
});



// User login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.user_id, isAdmin: user.role === 'admin' }, JWT_SECRET, {
            expiresIn: '1d', // 1 day
        });
        res.status(200).json({ user, token });
    });
});

// User signup endpoint
app.post('/api/signup', (req, res) => {
    const { email, password, firstName, lastName, dateOfBirth, address, phoneNumber, role } = req.body;
    db.run('INSERT INTO Users (email, password, role, first_name, last_name, date_of_birth, address, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, password, role, firstName, lastName, dateOfBirth, address, phoneNumber], function (err) {
            if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ error: 'Internal server error' });
            }
            const userId = this.lastID;
            const token = jwt.sign({ id: userId, isAdmin: role === 'admin' }, JWT_SECRET, {
            expiresIn: '1d', // 1 day
            });
            res.status(200).json({ user: { id: userId, email, role, firstName, lastName, dateOfBirth, address, phoneNumber }, token });
        });
});

// Fetch authenticated user info
app.get('/api/user', verifyToken, (req, res) => {
    const userId = req.user.id;
    db.get('SELECT * FROM Users WHERE user_id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(user);
    });
});

// CRUD operations for Authors
app.post('/api/authors', (req, res) => {
	const { name, biography, date_of_birth, nationality, photo_url } = req.body;
	db.run(
		'INSERT INTO Authors (name, biography, date_of_birth, nationality, photo_url) VALUES (?, ?, ?, ?, ?)',
		[name, biography, date_of_birth, nationality, photo_url],
		function (err) {
			if (err) {
				console.error('Error inserting author:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Author inserted successfully' });
		}
	);
});

app.get('/api/authors', (req, res) => {
	db.all('SELECT * FROM Authors', [], (err, rows) => {
		if (err) {
			console.error('Error fetching authors:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json(rows);
	});
});

// Get author by ID
app.get('/api/authors/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Authors WHERE author_id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching author by ID:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            console.log('Author not found');
            res.status(404).json({ error: 'Author not found' });
            return;
        }
        res.json(row);
    });
});


app.put('/api/authors/:id', (req, res) => {
	const { id } = req.params;
	const { name, biography, date_of_birth, nationality, photo_url } = req.body;
	db.run(
		'UPDATE Authors SET name = ?, biography = ?, date_of_birth = ?, nationality = ?, photo_url = ? WHERE author_id = ?',
		[name, biography, date_of_birth, nationality, photo_url, id],
		function (err) {
			if (err) {
				console.error('Error updating author:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Author updated successfully' });
		}
	);
});

app.delete('/api/authors/:id', (req, res) => {
	const { id } = req.params;
	db.run('DELETE FROM Authors WHERE author_id = ?', id, function (err) {
		if (err) {
			console.error('Error deleting author:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json({ message: 'Author deleted successfully' });
	});
});

// Search authors
app.get('/authors/search', (req, res) => {
    const query = req.query.query;
    db.all('SELECT * FROM Authors WHERE name LIKE ?', [`%${query}%`], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(rows);
        }
    });
});

// CRUD operations for Categories
app.post('/api/categories', (req, res) => {
	const { name, description } = req.body;
	db.run(
		'INSERT INTO Categories (name, description) VALUES (?, ?)',
		[name, description],
		function (err) {
			if (err) {
				console.error('Error inserting category:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Category inserted successfully' });
		}
	);
});


// Get category by ID
app.get('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM Categories WHERE category_id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching category by ID:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(row);
    });
});

app.get('/api/categories', (req, res) => {
	db.all('SELECT * FROM Categories', [], (err, rows) => {
		if (err) {
			console.error('Error fetching categories:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json(rows);
	});
});

app.put('/api/categories/:id', (req, res) => {
	const { id } = req.params;
	const { name, description } = req.body;
	db.run(
		'UPDATE Categories SET name = ?, description = ? WHERE category_id = ?',
		[name, description, id],
		function (err) {
			if (err) {
				console.error('Error updating category:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Category updated successfully' });
		}
	);
});

app.delete('/api/categories/:id', (req, res) => {
	const { id } = req.params;
	db.run('DELETE FROM Categories WHERE category_id = ?', id, function (err) {
		if (err) {
			console.error('Error deleting category:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json({ message: 'Category deleted successfully' });
	});
});

// CRUD operations for Orders
app.post('/api/orders', (req, res) => {
    const { user_id, order_date, total_amount, status, shipping_address, billing_address, payment_method } = req.body;
    db.run(
        'INSERT INTO Orders (user_id, order_date, total_amount, status, shipping_address, billing_address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, order_date, total_amount, status, shipping_address, billing_address, payment_method],
        function (err) {
            if (err) {
                console.error('Error inserting order:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.status(201).json({ message: 'success' , order_id: this.lastID});
        }
    );
});

// Get Orders by User ID
app.get('/api/orders/user', (req, res) => {
    const userId = req.query.user_id;
    db.all('SELECT * FROM Orders WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/orders', (req, res) => {
	db.all('SELECT * FROM `Orders`', [], (err, rows) => {
		if (err) {
			console.error('Error fetching orders:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json(rows);
	});
});

// Search categories
app.get('/categories/search', (req, res) => {
    const query = req.query.query;
    db.all('SELECT * FROM Categories WHERE name LIKE ?', [`%${query}%`], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(rows);
        }
        });
});

app.put('/api/orders/:id', (req, res) => {
	const { id } = req.params;
	const { user_id, order_date, total_amount, status, shipping_address, billing_address, payment_method } = req.body;
	db.run(
		'UPDATE `Orders` SET user_id = ?, order_date = ?, total_amount = ?, status = ?, shipping_address = ?, billing_address = ?, payment_method = ? WHERE order_id = ?',
		[user_id, order_date, total_amount, status, shipping_address, billing_address, payment_method, id],
		function (err) {
			if (err) {
				console.error('Error updating order:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Order updated successfully' });
		}
	);
});

app.delete('/api/orders/:id', (req, res) => {
	const { id } = req.params;
	db.run('DELETE FROM `Orders` WHERE order_id = ?', id, function (err) {
		if (err) {
			console.error('Error deleting order:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json({ message: 'Order deleted successfully' });
	});
});


// CRUD operations for OrderItems
app.post('/api/orderitems', (req, res) => {
	const { order_id, book_id, quantity, price } = req.body;
	const unit_price = price;
	const total_price = price * quantity;
	db.run(
		'INSERT INTO OrderItems (order_id, book_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
		[order_id, book_id, quantity, unit_price, total_price],
		function (err) {
			if (err) {
				console.error('Error inserting order item:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.status(201).json({ message: 'success' });
		}
	);
})

app.get('/api/orderitems', (req, res) => {
	db.all('SELECT * FROM OrderItems', [], (err, rows) => {
		if (err) {
			console.error('Error fetching order items:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json(rows);
	});
});

// Get Order Items by Order ID
app.get('/api/orderitems/order', (req, res) => {
    const orderId = req.query.order_id;
    db.all('SELECT * FROM OrderItems WHERE order_id = ?', [orderId], (err, rows) => {
        if (err) {
            console.error('Error fetching order items:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

app.put('/api/orderitems/:id', (req, res) => {
	const { id } = req.params;
	const { order_id, book_id, quantity, unit_price, total_price } = req.body;
	db.run(
		'UPDATE OrderItems SET order_id = ?, book_id = ?, quantity = ?, unit_price = ?, total_price = ? WHERE order_item_id = ?',
		[order_id, book_id, quantity, unit_price, total_price, id],
		function (err) {
			if (err) {
				console.error('Error updating order item:', err);
				res.status(500).json({ error: 'Internal server error' });
				return;
			}
			res.json({ message: 'Order item updated successfully' });
		}
	);
});

app.delete('/api/orderitems/:id', (req, res) => {
	const { id } = req.params;
	db.run('DELETE FROM OrderItems WHERE order_item_id = ?', id, function (err) {
		if (err) {
			console.error('Error deleting order item:', err);
			res.status(500).json({ error: 'Internal server error' });
			return;
		}
		res.json({ message: 'Order item deleted successfully' });
	});
});


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});