const express = require("express");
const morgan = require("morgan");

const app = express();
const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
// tells express to expect form data in URL-encoded format.
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

function isContactInContacts(firstName, lastName, contacts) {
  firstName = firstName.toLowerCase();
  lastName = lastName.toLowerCase();
  for (let index = 0; index < contacts.length; index += 1) {
    const currentContact = contacts[index];
    const currentFirstName = currentContact.firstName.toLowerCase();
    const currentLastName = currentContact.lastName.toLowerCase();
    if (firstName === currentFirstName && lastName === currentLastName) {
      return true;
    }
  }

  return false;
}

app.post(
  "/contacts/new",
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  (req, res, next) => {
    res.locals.firstName = req.body.firstName.trim();
    res.locals.lastName = req.body.lastName.trim();
    res.locals.phoneNumber = req.body.phoneNumber.trim();
    next();
  },
  (req, res, next) => {
    const firstName = res.locals.firstName;
    if (firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    } else if (firstName.length > 25) {
      res.locals.errorMessages.push(
        "First name cannot be more than 25 characters."
      );
    } else if (!/^[a-zA-Z]+$/.test(firstName)) {
      res.locals.errorMessages.push(
        "First name can only contain alphabetic characters."
      );
    }

    next();
  },
  (req, res, next) => {
    const lastName = res.locals.lastName;
    if (lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    } else if (lastName.length > 25) {
      res.locals.errorMessages.push(
        "Last name cannot be more than 25 characters."
      );
    } else if (!/^[a-zA-Z]+$/.test(lastName)) {
      res.locals.errorMessages.push(
        "Last name can only contain alphabetic characters."
      );
    }

    next();
  },
  (req, res, next) => {
    const phoneNumberPattern = /^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/;
    const phoneNumber = res.locals.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    } else if (!phoneNumber.match(phoneNumberPattern)) {
      res.locals.errorMessages.push(
        "Please enter a valid phone number with the pattern: ###-###-####"
      );
    }

    next();
  },
  (req, res, next) => {
    console.log("looking for duplicates");
    const { firstName, lastName } = res.locals;
    if (isContactInContacts(firstName, lastName, contactData)) {
      res.locals.errorMessages.push(
        "Contact already exist. Each contact must be unique."
      );
    }

    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: res.locals.firstName.trim(),
      lastName: res.locals.lastName.trim(),
      phoneNumber: res.locals.phoneNumber.trim(),
    });
    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000");
});
