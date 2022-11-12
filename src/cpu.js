const instructions = require("./instructions");
const createMemory = require("./memory");
const intSize = 8;

class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registerNames = [
      'ip', 'acc',
      'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7',
      'sp', 'fp'
    ]

    this.registers = createMemory(this.registerNames.length * intSize);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * intSize;
      return map;      
    }, {});

    this.setRegister32('sp', memory.byteLength - intSize);
  }

  debug() {
    this.registerNames.forEach(name => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(16, '0')}`)
    })
    console.log();
  }

  viewMemoryAt(address) {
    const nextEightQWords = Array.from({length: 8}, (_, i) =>
      this.memory.getUint32(address + i * 4)
    ).map(v => `0x${v.toString(16).padStart(8, '0')}`);

    console.log(`0x${address.toString(16).padStart(8, '0')}: ${nextEightQWords.join(' ')}`)
  }

  getRegister(name) {
    if (!name in this.registerMap) {
      throw new Error(`no such register '${name}'`);
    }
    return this.registers.getBigUint64(this.registerMap[name]);
  }

  getRegister32(name) {
    if (!name in this.registerMap) {
      throw new Error(`no such register '${name}'`);
    }
    return this.registers.getUint32(this.registerMap[name] + 4);
  }

  setRegister(name, value) {
    if (!name in this.registerMap) {
      throw new Error(`no such register '${name}'`);
    }
    return this.registers.setBigUint64(this.registerMap[name], value);
  }

  setRegister32(name, value) {
    if (!name in this.registerMap) {
      throw new Error(`no such register '${name}'`);
    }
    return this.registers.setUint32(this.registerMap[name] + 4, value);
  }

  fetch32() {
    const nextInstructionAddress = this.getRegister32('ip');
    const instruction = this.memory.getUint32(nextInstructionAddress);
    this.setRegister('ip', BigInt(nextInstructionAddress + 4));
    return instruction;
  }

  fetch64() {
    const nextInstructionAddress = this.getRegister32('ip');
    const instruction = this.memory.getBigUint64(nextInstructionAddress);
    this.setRegister('ip', BigInt(nextInstructionAddress + 8));
    return instruction;
  }

  push(value) {
    const spAddress = this.getRegister32('sp');
    this.memory.setBigUint64(spAddress, value);
    this.setRegister('sp', spAddress - intSize);
  }

  execute(instruction) {
    switch (instruction) {
      // move lit to reg
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch64();
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        this.registers.setBigUint64(r1, literal);
        return;
      }
      // move reg to reg
      case instructions.MOV_REG_REG: {
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const r2 = (this.fetch32() % this.registerNames.length) * intSize;
        const registerValue1 = this.registers.getBigUint64(r1);
        this.registers.setBigUint64(r2, registerValue1);
        return;
      }
      // move reg to reg
      case instructions.MOV_REG_MEM: {
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const addr = this.fetch32();
        const registerValue1 = this.registers.getBigUint64(r1);
        this.memory.setBigUint64(addr, registerValue1);
        return;
      }
      // move reg to reg
      case instructions.MOV_MEM_REG: {
        const addr = this.fetch32();
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const memValue = this.memory.getBigUint64(addr);
        this.registers.setBigUint64(r1, memValue);
        return;
      }

      // add registers
      case instructions.ADD_REG_REG: {
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const r2 = (this.fetch32() % this.registerNames.length) * intSize;
        const registerValue1 = this.registers.getBigUint64(r1);
        const registerValue2 = this.registers.getBigUint64(r2);
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }
      // jump if not equal
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch64();
        const address = this.fetch32();

        const cmp = this.getRegister('acc');

        if (value !== cmp) {
          this.setRegister32('ip', address);
        }

        return;
      }
      // push a literal
      case instructions.PSH_LIT: {
        const value = this.fetch64();
        this.push(value);
        return;
      } 
      // push a register
      case instructions.PSH_REG: {
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const registerValue1 = this.registers.getBigUint64(r1);
        this.push(registerValue1);
        return;
      } 
      // pop from stack
      case instructions.POP: {
        const r1 = (this.fetch32() % this.registerNames.length) * intSize;
        const spAddress = this.getRegister32('sp') + intSize;
        this.setRegister('sp', spAddress);
        const memValue = this.memory.getBigUint64(spAddress);
        this.registers.setBigUint64(r1, memValue);

        return;
      } 
      // nothing
      case instructions.NOP: {
        return;
      }

      default: {
        throw new Error(`no such instruction '${instruction}'`);
      }
    }
  }

  step() {
    const instruction = this.fetch32();
    return this.execute(instruction);
  }
}

module.exports = CPU;