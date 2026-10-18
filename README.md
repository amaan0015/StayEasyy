# StayEasyy 🏠

**A full-stack rental accommodation platform connecting tenants with
property owners.**

StayEasyy helps users explore rental properties, submit enquiries, and
communicate with property owners through real-time chat and
notifications.

-   **Live application:** https://stay-easyy-one.vercel.app
-   **Backend API:** https://stayeasyy-pna8.onrender.com
-   **GitHub repository:** https://github.com/amaan0015/StayEasyy

> Note: The live service may take a short time to respond if the backend
> is waking up from an idle state.

## ✨ Features

-   **User authentication:** Register and log in with JWT-based
    authentication.
-   **Role-based access:** Supports tenant and property-owner roles.
-   **Property listings:** Browse rental accommodation listings.
-   **Search and filtering:** Find properties using available search
    criteria such as location, property type, and maximum rent.
-   **Enquiry management:** Submit enquiries about properties.
-   **Real-time messaging:** Tenant and owner chat powered by Socket.IO.
-   **Notifications:** Receive notifications for new messages and
    navigate to the relevant chat.
-   **Image uploads:** Cloudinary integration for property images.
-   **Persistent storage:** MongoDB stores application data.

## 🧰 Tech Stack

  Area                      Technologies
  ------------------------- -------------------------------------
  Frontend                  React, Vite, Tailwind CSS
  Routing                   React Router
  Backend                   Node.js, Express.js
  Database                  MongoDB, Mongoose
  Authentication            JSON Web Tokens (JWT), bcrypt
  Real-time communication   Socket.IO
  Image hosting             Cloudinary
  API testing               Postman
  Deployment                Vercel (frontend), Render (backend)

## 🏗️ Project Structure

``` text
StayEasyy/
├── frontend/       # React client application
└── backend/        # Express API and Socket.IO server
```

## 🚀 Run Locally

### Prerequisites

-   Node.js and npm
-   MongoDB connection string
-   Cloudinary account and credentials if using image uploads

### 1. Clone the repository

``` bash
git clone https://github.com/amaan0015/StayEasyy.git
cd StayEasyy
```

### 2. Configure the backend

``` bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. Use the variable names
expected by your backend configuration. A typical configuration may look
like this:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
CLIENT_URL=http://localhost:5173
```

If your code uses a different MongoDB variable name, or requires
Cloudinary credentials, configure those exact names as defined in your
backend code. Never commit real secrets to GitHub.

Start the backend using the script defined in `backend/package.json`,
for example:

``` bash
npm run dev
```

If no `dev` script exists, use the appropriate start script configured
in that package.

### 3. Configure the frontend

Open a second terminal:

``` bash
cd StayEasyy/frontend
npm install
```

Configure the frontend API base URL using the environment variable
expected by your API client. For example, if it uses Vite environment
variables:

``` env
VITE_API_URL=http://localhost:5000
```

Make sure the variable name matches the one used in your frontend code.

Start the frontend:

``` bash
npm run dev
```

Open the local URL shown by Vite in your terminal.

## 🔌 API and Real-Time Communication

The backend provides REST API endpoints for authentication, properties,
enquiries, and related application functionality. Socket.IO supports
real-time chat and message notifications.

For exact endpoint paths and request formats, refer to the route files
in `backend`. You can test supported REST endpoints using Postman.

## 🧪 Testing

The following flows were manually tested during development:

-   Enquiry submission returned HTTP `201`, and the enquiry was saved in
    MongoDB.
-   Tenant-to-owner real-time message delivery.
-   Owner-to-tenant real-time message delivery.
-   Clicking a new-message notification navigated to the chat page.

These are manual checks, not a claim of automated test-suite coverage.

## 🔐 Security Notes

-   Keep `.env` files and all credentials out of version control.
-   Use a strong, unique JWT secret.
-   Configure CORS to allow only the frontend origins you intend to
    support.
-   Validate and authorize protected requests on the backend.

## 🌱 Future Improvements

-   Automated backend and frontend tests.
-   Pagination and more advanced property filters.
-   Improved loading, empty, and error states.
-   Property-owner listing management and moderation improvements.
-   Accessibility and mobile UI refinements.

## 👨‍💻 Author

**Amaan Alam**

-   GitHub: [amaan0015](https://github.com/amaan0015)

------------------------------------------------------------------------

Built as a full-stack project to practice React, Node.js, MongoDB,
authentication, API development, and real-time communication.
