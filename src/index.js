const readline = require('readline');
const createMemory = require('./memory');
const CPU = require('./cpu');
const instructions = require('./instructions');

const IP = 0;
const ACC = 1;
const R0 = 2;
const R1 = 3;
const R2 = 4;
const R3 = 5;
const R4 = 6;
const R5 = 7;
const R6 = 8;
const R7 = 9;
const SP = 10;
const FP = 11;

const memory = createMemory(256*1024);
const cpu = new CPU(memory);

let i = 0;

memory.setUint32(i, instructions.MOV_MEM_REG); i += 4;
memory.setUint32(i, 0x0100); i += 4;
memory.setUint32(i, R0); i += 4;

memory.setUint32(i, instructions.MOV_LIT_REG); i += 4;
memory.setBigUint64(i, BigInt(0x0001)); i += 8;
memory.setUint32(i, R1); i += 4;

memory.setUint32(i, instructions.ADD_REG_REG); i += 4;
memory.setUint32(i, R0); i += 4;
memory.setUint32(i, R1); i += 4;

memory.setUint32(i, instructions.MOV_REG_MEM); i += 4;
memory.setUint32(i, ACC); i += 4;
memory.setUint32(i, 0x0100); i += 4;

memory.setUint32(i, instructions.JMP_NOT_EQ); i += 4;
memory.setBigUint64(i, BigInt(0x0003)); i += 8;
memory.setUint32(i, 0x0000); i += 4;


cpu.viewMemoryAt(0x0000);
cpu.debug();
cpu.step();
cpu.debug();
cpu.step();
cpu.debug();
cpu.step();
cpu.debug();
cpu.step();
cpu.debug();
cpu.viewMemoryAt(0x0100);

const rl = readline.createInterface({
  input: process.stdin,
  input: process.stdout,
});

rl.on('line', () => {
  cpu.step();
  cpu.debug();
  cpu.viewMemoryAt(cpu.getRegister32('ip'));
  cpu.viewMemoryAt(0x0100);
});