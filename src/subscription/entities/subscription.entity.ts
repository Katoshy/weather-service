import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SubscriptionFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  city: string;

  @Column({
    type: 'enum',
    enum: SubscriptionFrequency,
    default: SubscriptionFrequency.DAILY,
  })
  frequency: SubscriptionFrequency;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ unique: true })
  confirmationToken: string;

  @Column({ unique: true })
  unsubscribeToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastSentAt: Date;
}