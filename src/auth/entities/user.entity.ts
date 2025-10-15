import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 320, unique: true, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  phoneNumber?: string | null;

  // OTP stored as string (nullable). Marked optional in TS with ?
  @Column({ type: 'varchar', length: 16, nullable: true })
  otp?: string | null;

  // Expiration timestamp for the otp (nullable)
  @Column({ type: 'timestamptz', nullable: true })
  otpExpiresAt?: Date | null;

  // For Google OAuth (nullable)
  @Column({ type: 'varchar', length: 128, nullable: true })
  googleId?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
