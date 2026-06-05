import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Testcase } from "./Testcase.js";
import { TestLog } from "./TestLog.js";

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

  @ManyToOne(() => Testcase, testcase => testcase.runs, { onDelete: "CASCADE" })
  testcase!: any;

  @OneToMany(() => TestLog, log => log.run)
  logs!: TestLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
