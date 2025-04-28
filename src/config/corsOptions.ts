import cors from "cors";
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Specify which methods are allowed
  allowedHeaders: ["Content-Type", "Authorization"], // Specify which headers are allowed
  credentials: true,
};

export default corsOptions;
