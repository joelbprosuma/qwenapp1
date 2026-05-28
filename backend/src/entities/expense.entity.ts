import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum ExpenseCategory {
  ALIMENTATION = 'alimentation',
  TRANSPORT = 'transport',
  LOGEMENT = 'logement',
  SERVICES = 'services',
  FOURNITURES = 'fournitures',
  EQUIPEMENT = 'equipement',
  MARKETING = 'marketing',
  AUTRE = 'autre',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'enum', enum: ExpenseCategory, default: ExpenseCategory.AUTRE })
  category: ExpenseCategory;

  @Column({ nullable: true })
  merchantName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  ocrData: string;

  @Column()
  expenseDate: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  notes: string;
}
