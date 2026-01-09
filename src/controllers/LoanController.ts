import { Request, Response, NextFunction } from 'express';

import { LoanResponseDto } from '../dto/loan/loan-response.dto';
import { LoanService } from '../services/LoanService';

export class LoanController {
  private loanService = new LoanService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loans = await this.loanService.list();
      const loansDto = loans.map((loan) => new LoanResponseDto(loan));
      res.customSuccess(200, 'List of loans', loansDto);
    } catch (err) {
      next(err);
    }
  };

  one = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loan = await this.loanService.one(Number(req.params.id));
      res.customSuccess(200, 'Loan details', new LoanResponseDto(loan));
    } catch (err) {
      next(err);
    }
  };

  save = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loan = await this.loanService.save(req.body);
      res.customSuccess(201, 'Loan created', new LoanResponseDto(loan));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loan = await this.loanService.update(Number(req.params.id), req.body);
      res.customSuccess(200, 'Loan updated', new LoanResponseDto(loan));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.loanService.delete(Number(req.params.id));
      res.customSuccess(200, 'Loan deleted');
    } catch (err) {
      next(err);
    }
  };
}
