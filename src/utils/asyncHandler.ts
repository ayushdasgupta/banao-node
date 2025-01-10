import { Request, Response, NextFunction } from "express";

const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            next(error); 
        }
    };
};

export { asyncHandler };