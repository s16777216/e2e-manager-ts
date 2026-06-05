import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { TestRun } from "./TestRun.js";

@Entity()
export class TestLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("integer")
  stepIdx!: number;

  @Column("text")
  stepDescription!: string;

  @Column("text", { nullable: true })
  action?: string;

  @Column("text", { nullable: true })
  result?: string;

  @Column("text", { nullable: true })
  aiResponse?: string;

  @Column({ type: "bytea", nullable: true, select: false })
  screenshotData?: Buffer;

  @ManyToOne(() => TestRun, run => run.logs, { onDelete: "CASCADE" })
  run!: any;

  @CreateDateColumn()
  createdAt!: Date;
}
