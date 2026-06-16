import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Testcase } from "./Testcase.js";
import { TestLog } from "./TestLog.js";
import { Task } from "./Task.js";

@Entity()
export class TestRun {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { default: "pending" })
  status!: string; // pending | running | passed | failed | error

  @Column("timestamp", { nullable: true })
  startedAt?: Date;

  @Column("timestamp", { nullable: true })
  finishedAt?: Date;

  @Column("varchar", { nullable: true })
  finalResult?: string;

  @Column("text", { nullable: true })
  finalReason?: string;

  @Column({ type: "bytea", nullable: true })
  screenshotFailData?: Buffer;

  @Column("integer", { default: 0 })
  asserterPromptTokens!: number;

  @Column("integer", { default: 0 })
  asserterCompletionTokens!: number;

  @Column("integer", { default: 0 })
  asserterTotalTokens!: number;

  @Column("integer", { default: 0 })
  totalPromptTokens!: number;

  @Column("integer", { default: 0 })
  totalCompletionTokens!: number;

  @Column("integer", { default: 0 })
  totalTokens!: number;

  @ManyToOne(() => Testcase, testcase => testcase.runs, { onDelete: "CASCADE" })
  testcase!: any;

  @OneToMany(() => TestLog, log => log.run)
  logs!: TestLog[];

  @ManyToOne(() => Task, task => task.runs, { nullable: true, onDelete: "SET NULL" })
  task!: Task | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

