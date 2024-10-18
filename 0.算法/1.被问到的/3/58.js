// 100以内质数
// 质数（也称为素数）是指在大于 1 的自然数中，除了 1 和它本身外，不能被其他自然数整除的数。换句话说，质数只有两个正因数：1 和它本身。
// 2, 3, 5, 7, 13

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function getPrimesUpTo100() {
  const primes = [];
  for (let i = 2; i <= 100; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

console.log(getPrimesUpTo100());