require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const Item = require("./models/Item");
app.use(express.json());
app.use(cors());
const User = require("./models/User");

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Primeira API" });
});

app.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }
  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido" });
  }
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res.status(422).json({ msg: "Nome obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "E-mail obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "E-mail já cadastrado" });
  }
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuário cadastrado com sucesso" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(422).json({ msg: "E-mail obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não cadastrado" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha incorreta" });
  }
  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );
    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
  } catch {
    error;
    res.status(500).json({ msg: error });
  }
});

app.post("/auth/logout", (req, res) => {
  res.status(200).json({ msg: "Logout realizado com sucesso" });
});

app.post("/auth/crud", async (req, res) => {
  try {
    const data = req.body;
    const newItem = new Item(data);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Erro ao salvar os dados no MongoDB:", error);
    res.status(500).json({ error: "Erro ao salvar os dados no MongoDB" });
  }
});

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.1v9vtoc.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou yaay!!");
  })
  .catch((err) => console.log(err));
