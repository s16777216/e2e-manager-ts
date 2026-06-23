import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { TestRunStep } from "./TestRunStep.js";

@Entity()
export class TestLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { nullable: true })
  action?: string;

  @Column("text", { nullable: true })
  result?: string;

  @Column("text", { nullable: true })
  aiResponse?: string;

  @Column("integer", { default: 0 })
  promptTokens!: number;

  @Column("integer", { default: 0 })
  completionTokens!: number;

  @Column("integer", { default: 0 })
  totalTokens!: number;

  @ManyToOne(() => TestRunStep, step => step.logs, { onDelete: "CASCADE" })
  step!: TestRunStep;

  @CreateDateColumn()
  createdAt!: Date;
}
