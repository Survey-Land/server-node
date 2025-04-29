import express, { Application } from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorMiddleware";
import { notFoundHandler } from "./middleware/not-foundMiddleware";
import qs from "qs";
import passport from "./config/passport";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import helmet from "helmet";
import dotenv from "dotenv";
import limiterOptions from "./config/limiterOptions";
import i18n from "i18n";
import i18nConfig from "./config/i18n";

dotenv.config();

export default class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureCore();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandlers();
    this.app.use(i18nConfig.init);
  }

  private configureCore(): void {
    this.app.set("query parser", (str: any) =>
      qs.parse(str, { allowDots: true })
    );
    this.app.set("trust proxy", 1);
  }

  private configureMiddlewares(): void {
    this.app.use(
      helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
    );
    this.app.use(cors(corsOptions));
    this.app.use(limiterOptions);
    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(passport.initialize());
    this.app.use(i18n.init);
  }

  private configureRoutes(): void {
    this.app.use("/api", routes);
  }

  private configureErrorHandlers(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async listen(
    port: number | string = process.env.PORT || 3000
  ): Promise<void> {
    const portNumber = typeof port === "string" ? parseInt(port, 10) : port;

    this.app.listen(portNumber, () => {
      console.log(`Server running on http://localhost:${portNumber}`);
    });
  }
}
