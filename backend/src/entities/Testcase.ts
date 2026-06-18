import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TestGroup } from "./TestGroup.js";
import { TestRun } from "./TestRun.js";

@Entity()
export class Testcase {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  name!: string;

  @Column("simple-json")
  steps!: string[];

  @Column("text")
  expected!: string;

  @ManyToOne(() => TestGroup, group => group.testcases, { onDelete: "CASCADE" })
  group!: any;

  @OneToMany(() => TestRun, run => run.testcase)
  runs!: TestRun[];

  @Column("jsonb", { nullable: true })
  initCookies?: any;

  @Column("jsonb", { nullable: true })
  initLocalStorage?: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
