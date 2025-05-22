import cors from "cors";
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify which methods are allowed
  allowedHeaders: ["Content-Type", "Authorization", "accept-language"], // Specify which headers are allowed
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  exposedHeaders: ["accept-language"],
};

export default corsOptions;
