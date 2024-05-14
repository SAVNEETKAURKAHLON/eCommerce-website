import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import { register } from "module";
import multer from "multer";

const app = express();
const port = 5000;

const upload = multer({storage:multer.memoryStorage()})

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: null,
    database: "full_stack"
});

app.get("", (req, res) => {
    res.render("login.ejs");
})

app.post("/", (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const sql = "SELECT * FROM user_login WHERE username = ? AND password = ?";
            const values = [req.body.email, req.body.password];

            connection.query(sql, values, (err, rows) => {
                connection.release();
                if (!err) {
                    console.log(rows);
                    if (rows.length > 0) {
                        console.log("login successful");
                        res.redirect("/home");

                    }
                    else {
                        console.log("invalid credentials");
                        res.render("login.ejs", {log : "INVALID CREDENTIALS!"});
                    }
                }
                else {
                    console.log(err);
                }
            })
        }
    })
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {

            const usern = req.body.username;
            const pass1 = req.body.password;
            const pass2 = req.body.first_pass;
            const values = {
                name: req.body.name,
                username: req.body.username,
                password: req.body.password,
                contact: req.body.contact
            };
            const exist_user = 'SELECT * from user_login WHERE username = ?';
            const sql = 'INSERT INTO user_login SET ?';

            connection.query(exist_user, [usern], (err, rows) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows.length > 0) {
                    console.log("username already exists");
                    connection.release();
                    return res.render("login.ejs",{user: "User Already Exists"});
                }
                else {
                    if ((pass1 === pass2)) {
                        if (pass1.length >= 8) {
                            connection.query(sql, values, (err, rows) => {
                                if (!err) {

                                    connection.release();
                                    // res.render("home.ejs");
                                    res.redirect("/home")
                                }
                                else {
                                    console.log(err);
                                }

                            })
                        } else {
                            console.log("password is not powerful, must be above 8 character");
                            res.render("register.ejs",{user: "password is not powerful, must be above 8 character"});

                        }


                    }
                    else {
                        console.log("password do not match");
                        res.render("register.ejs",{user:"password do not match"});
                    }
                }
            })


        }
    })
})

app.get("/adminlogin", (req, res) => {
    res.render("admin_login.ejs");
})

app.post("/adminlogin", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const values = [req.body.email, req.body.password];
            const sql = "SELECT * FROM admin_login WHERE username = ? AND password = ?";

            connection.query(sql, values, (err, rows) => {
                connection.release();
                if (!err) {
                    console.log(rows);
                    if (rows.length > 0) {
                        console.log("login successful");
                        res.redirect("/admin_product");

                    }
                    else {
                        console.log("invalid credentials");
                        res.render("admin_login.ejs", {log : "INVALID CREDENTIALS!"});
                    }
                }
                else {
                    console.log("first");
                }
            })
        }
    })
})

app.get("/home", (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const sql = "SELECT * from products";
            connection.query(sql, (err, rows) => {
                connection.release();
                if (err) {

                    console.log(err);
                }
                else {
                    res.render("home.ejs", { rows: rows });

                }
            })
        }
    })
})

app.get("/cart", (req, res) => {
    res.render("cart.ejs");
})

app.get("/products", (req,res) => {
    res.redirect("home");
})

app.get("/add_product", (req, res) => {
    res.render("add_product.ejs");
})

app.get("/admin_product", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const sql = "SELECT * from products";
            connection.query(sql, (err, rows) => {
                connection.release();
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    res.render("admin_product.ejs", { rows: rows });

                }
            })
        }
    })
})

app.post("/product_form", upload.single('productImage'),(req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {

            const product_name = req.body.product_name;
            // console.log(product_name);
            const product_price = req.body.product_price;
            const values = {
                product_name: req.body.product_name,
                product_price: req.body.product_price,
                file_src:req.file.buffer.toString('base64')
            };
            const exist_product = 'SELECT * from products WHERE product_name = ?';
            const sql = 'INSERT INTO products SET ?';


            connection.query(sql, values, (err, rows) => {
                if (!err) {

                    connection.release();
                    console.log(values);
                    console.log("product added")
                    res.redirect("/admin_product");
                }
                else {
                    console.log(err);
                }

            });

        }
    })
})


app.get("/product_update", (req, res) => {
    pool.getConnection((err, connection) => {
        var id = req.query.id;
        console.log("id is" + id);
        if (err) {
            console.log(err);
        }
        else {

            const sql = "SELECT * from products where id=?";
            connection.query(sql, [id], (err, rows) => {
                connection.release();
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    res.render("product_update.ejs", { rows: rows });

                }
            })
        }
    })
})
app.post("/product_update", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            var product_name = req.body.product_name;
            var product_price = req.body.product_price;
            var id = req.query.id;
            const sql = "UPDATE products SET product_name = ?, product_price = ? where id=?";
            connection.query(sql, [product_name, product_price, id], (err, rows) => {
                connection.release();
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    res.redirect("/admin_product");

                }
            })
        }
    })
})

app.post("/product_delete", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const id = req.query.id;
            const sql = "DELETE FROM products WHERE id = ?";
            connection.query(sql, [id], (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect("/admin_product");
                    console.log("deleted");
                }
            })
        }
    })
})

app.get("/addtocart", (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
        }
        else {
            const id = req.query.id;
            const sql = "SELECT * from products WHERE id=?"
            connection.query(sql, [id], (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    console.log("fetch");
                    res.render("cart.ejs", { rows: rows })
                }
            })
        }
    })
})

app.post("/addtocart", upload.single('productImage'), (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const values = {
                id: req.query.id,
                product: req.body.product,
                product_price: req.body.product_price,
                quantity: req.body.quantity,
            };

            const sqlSelect = 'SELECT * FROM add_to_cart WHERE id = ?';
            const sqlInsert = 'INSERT INTO add_to_cart SET ?';

            connection.query(sqlSelect, [values.id], (err, rows) => {
                if (err) {
                    console.log(err);
                    connection.release();
                    return;
                }

                if (rows.length > 0) {
                    console.log("Product already exists");
                    connection.release();
                    res.redirect("/home");
                    return;
                }

                connection.query(sqlInsert, [values], (err, rows) => {
                    if (err) {
                        console.log(err);
                        connection.release();
                        return;
                    }
                    console.log("Product added");
                    connection.release();
                    res.redirect("/home");
                });
            });
        }
    });
});


app.get("/mycart", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const id = req.query.id;
            const sql = "SELECT * from add_to_cart";
            const sql2 = "SELECT * from orders";
            connection.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    connection.query(sql2, (err, orows) => {
                        if (err) {
                            console.log(err);
                        }
                        else {

                            connection.release();

                            console.log(orows);
                            res.render("mycart.ejs", { orders: orows, rows: rows })
                        }
                    })
                }
            })

        }
    })
})

app.get("/admin_order_list", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            const id = req.query.id;
            const sql = "SELECT * from orders";
            connection.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);

                    connection.release();

                    res.render("admin_order_list.ejs", { orders: rows })

                }
            })

        }
    })
})
app.get("/cart_form", (req,res) => {
    res.redirect("/mycart");
})
app.get("/addorder", (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
        }
        else {
            const id = req.query.id;
            console.log(id);
            const sql = "SELECT * from products WHERE id=?"
            const sqlDelete = "DELETE FROM add_to_cart WHERE id = ?";

            connection.query(sql, [id], (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(rows);
                    res.render("order.ejs", { rows: rows })
                }
            })
            connection.query(sqlDelete, [id], (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("deleted");
                    res.render("order.ejs", { rows: rows })
                }
            })
        }
    })
})

app.post("/addorder", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {

            console.log(req.body.product);
            const values = {
                product_id: req.query.id,
                product: req.body.product,
                product_price: req.body.product_price,
                quantity: req.body.quantity,
            };
            const sql = 'INSERT INTO orders SET ?';


            connection.query(sql, values, (err, rows) => {
                if (!err) {

                    connection.release();
                    console.log(values);
                    console.log("product added")
                    res.redirect("/home");
                }
                else {
                    console.log(err);
                }

            });

        }
    })
})
app.post("/order_status", (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        else {
            var order_status = req.body.order_status;
            var id = req.body.id;
            const sql = "UPDATE orders SET order_status = ? where id=?";
            connection.query(sql, [order_status, id], (err, rows) => {
                console.log("reached");
                connection.release();
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("chamnges");
                    res.redirect("/admin_order_list");

                }
            })
        }
    })
})

app.listen(port, () => {
    console.log("Running");
})