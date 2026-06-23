import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Testcase } from "./Testcase.js";

@Entity()
export class TestcaseStep {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("integer")
  stepIdx!: number;

  @Column("text")
  action!: string;

  @Column("text", { nullable: true })
  expected?: string;

  @ManyToOne(() => Testcase, testcase => testcase.steps, { onDelete: "CASCADE" })
  testcase!: Testcase;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
