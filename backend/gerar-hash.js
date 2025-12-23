import bcrypt from 'bcrypt';

const senha = 'admin123';
const hash = await bcrypt.hash(senha, 10);

console.log('Hash gerado:', hash);
console.log('\nExecute no banco:');
console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE username = 'admin';`);
