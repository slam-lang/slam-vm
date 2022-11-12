const ADD_REG_REG = 0x0001;
const MOV_LIT_REG = 0x0010;
const MOV_REG_REG = 0x0011;
const MOV_REG_MEM = 0x0012;
const MOV_MEM_REG = 0x0013;
const JMP_NOT_EQ = 0x0020;
const PSH_LIT = 0x0030;
const PSH_REG = 0x0030;
const NOP = 0x0000;

module.exports = {
  NOP,
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  MOV_MEM_REG,
  JMP_NOT_EQ,
  ADD_REG_REG,
  PSH_LIT,
  PSH_REG,
};