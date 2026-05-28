import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum InvoiceType {
  PURCHASE = 'purchase',
  SALE = 'sale',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column()
  type: InvoiceType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ nullable: true })
  supplierName: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  ocrData: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  paidDate: Date;

  @ManyToOne(() => User, (user) => user.invoices)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  reminderSent: boolean;
}
