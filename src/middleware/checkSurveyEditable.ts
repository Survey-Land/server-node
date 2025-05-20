import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { Role, User } from "@prisma/client";
import i18n from "../config/i18n";

export const checkSurveyEditable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user as User;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        responses: {
          select: { id: true },
        },
      },
    });

    if (!survey) {
      throw new Error("SURVEY_NOT_FOUND");
    }

    if (user?.role !== Role.ADMIN) {
      throw new Error("FORBIDDEN_EDIT");
    }

    if (survey.responses.length > 0) {
      throw new Error("SURVEY_HAS_RESPONSES");
    }

    next();
  } catch (error) {
    const err = (error as Error).message;

    switch (err) {
      case "SURVEY_NOT_FOUND":
        res.status(404).json({ message: i18n.__("Survey not found") });
        break;

      case "FORBIDDEN_EDIT":
        res.status(403).json({
          message: i18n.__("only admin can edit"),
        });
        break;

      case "SURVEY_HAS_RESPONSES":
        res.status(400).json({
          message: i18n.__("survey has responses"),
        });
        break;

      default:
        console.error("Unexpected error:", error);
        res.status(500).json({
          message: i18n.__("unexpected server error"),
        });
    }
  }
};
