import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { ApiRouter } from './routers/api.router';
import cron from 'node-cron'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()


export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
    this.setupScheduler()
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const apiRouter = new ApiRouter()

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student !`);
    });

    this.app.use('/api', apiRouter.getRouter())

  }

  private setupScheduler(): void {
    cron.schedule('0 */1 * * *', async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const oneHoursAgo = new Date()
      oneHoursAgo.setDate(oneHoursAgo.getHours() - 1)

      try {
        const ordersToUpdate = await prisma.order.findMany({
          where: {
            status: 'SHIPPED',
            shippedAt: {
              lt: sevenDaysAgo,
            },
          },
        });

        for (const order of ordersToUpdate) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED' },
          });
        }

        const failedOrder = await prisma.order.findMany({
          where: { status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', createdAt: { lt: oneHoursAgo } }
        })

        for (const order of failedOrder) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
          });
        }

      } catch (error) {
        console.error('Error running daily scheduler job:', error);
      }
    });
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
