import { getConnection } from '../database/database.js';
//parte logica y manejar la base de datos

const getBancoall = async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.query('select * from usuarios');
    res.json(result[0]);
  } catch (err) {
    console.log(err);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await getConnection();

    const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
    const [result] = await connection.query(query);

    if (result.length > 0) {
      const user = result[0];
      if (user.contraseña === password) {
        const userInfo = {
          nombre: user.nombre,
          tipo: user.tipo,
          numero_cuenta: user.numero_cuenta,
        };

        res.json({ success: true, message: 'Login exitoso', user: userInfo });
      } else {
        res.json({ success: false, message: 'Contraseña incorrecta' });
      }
    } else {
      res.json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.log(err);
  }
};

const saldo = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const [resultado] = await connection.query(`SELECT saldo FROM usuarios WHERE numero_cuenta = '${numeroCuenta}'`);

    const saldoActual = resultado[0]?.saldo;
    res.json({ success: true, saldo: saldoActual });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la consulta de saldo' });
  }
};

const historicoTransferencias = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const trasferenciaQuery = `SELECT * FROM transacciones WHERE numero_cuenta = '${numeroCuenta}'`;
    const [resultado] = await connection.query(trasferenciaQuery);

    res.json(resultado);
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en obtener el historico de transacciones' });
  }
};

const registroUsuario = async (req, res) => {
  try {
    const { telefono, nombre, email, contraseña, tipocuenta, saldo } = req.body;
    const connection = await getConnection();

    const queryemail = `SELECT * FROM usuarios WHERE email = '${email}'`;
    const [resultadoemail] = await connection.query(queryemail);

    if (resultadoemail.length > 0) {
      return res.json({ message: 'email ya esta registrado' });
    }

    const querytelefono = `SELECT * FROM usuarios WHERE numero_cuenta = '${telefono}'`;
    const [resultadotelefono] = await connection.query(querytelefono);

    if (resultadotelefono.length > 0) {
      return res.json({ message: 'telefono ya registrado' });
    }

    const queryInsert = `
  INSERT INTO usuarios (numero_cuenta, nombre, email, contraseña, tipo, saldo) 
  VALUES ('${telefono}', '${nombre}', '${email}', '${contraseña}', '${tipocuenta}', 0)
`;
    await connection.query(queryInsert);

    res.json({ success: true, message: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.json({ message: 'Error al registrar el usuario', error: err.message });
  }
};

const transferir = async (req, res) => {
  try {
    const { numeroCuentaOrigen, numeroCuentaDestino, monto } = req.body;
    const connection = await getConnection();

    const cuentaDestino = `SELECT saldo FROM usuarios WHERE numero_cuenta = '${numeroCuentaDestino}'`;
    const [resultadoCuentaDestino] = await connection.query(cuentaDestino);
    if (resultadoCuentaDestino.length === 0) {
      return res.json({ succes: false, message: 'La cuenta de destino no existe' });
    }

    const saldoOrigen = `SELECT saldo FROM usuarios WHERE numero_cuenta = '${numeroCuentaOrigen}'`;
    const [resultadoSaldoOrigen] = await connection.query(saldoOrigen);
    if (resultadoSaldoOrigen[0].saldo < monto) {
      return res.json({ succes: false, message: 'Saldo insuficiente' });
    }

    const actualizarOrigen = `UPDATE usuarios SET saldo = saldo - ${monto} WHERE numero_cuenta = '${numeroCuentaOrigen}'`;
    await connection.query(actualizarOrigen);

    const actualizarDestino = `UPDATE usuarios SET saldo = saldo + ${monto} WHERE numero_cuenta = '${numeroCuentaDestino}'`;
    await connection.query(actualizarDestino);

    const registrarTransaccion = `
  INSERT INTO transacciones (numero_cuenta, tipo, monto, fecha, numero_cuenta_destino) 
  VALUES ('${numeroCuentaOrigen}', 'transferencia', ${monto}, NOW(), '${numeroCuentaDestino}')
`;
    try {
      await connection.query(registrarTransaccion);
    } catch (error) {
      console.error('Error al registrar la transacción:', error);
    }

    res.json({ success: true, message: 'Transferencia realizada' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la transferencia' });
  }
};

const depositar = async (req, res) => {
  try {
    const { numeroCuenta, monto } = req.body;
    const connection = await getConnection();

    const actualizarSaldo = `UPDATE usuarios SET saldo = saldo + ${monto} WHERE numero_cuenta = '${numeroCuenta}'`;
    await connection.query(actualizarSaldo);

    const registrarTransaccion = `
  INSERT INTO transacciones (numero_cuenta, tipo, monto, fecha) 
  VALUES ('${numeroCuenta}', 'deposito', ${monto}, NOW())
`;
    await connection.query(registrarTransaccion);

    res.json({ success: true, message: 'Deposito realizado con exito' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la deposito' });
  }
};

const retirar = async (req, res) => {
  try {
    const { numeroCuenta, monto } = req.body;
    const connection = await getConnection();

    const consultaSaldo = `SELECT saldo FROM usuarios WHERE numero_cuenta = '${numeroCuenta}'`;
    const [resultadoSaldo] = await connection.query(consultaSaldo);

    if (resultadoSaldo[0].saldo < monto) {
      return res.json({ success: false, message: 'Saldo insuficiente' });
    }

    const actualizarSaldo = `UPDATE usuarios SET saldo = saldo - ${monto} WHERE numero_cuenta = '${numeroCuenta}'`;
    await connection.query(actualizarSaldo);

    const registrarTransaccion = `
  INSERT INTO transacciones (numero_cuenta, tipo, monto, fecha) 
  VALUES ('${numeroCuenta}', 'retiro', ${monto}, NOW())
`;
    await connection.query(registrarTransaccion);

    res.json({ success: true, message: 'Retiro realizado con exito' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la deposito' });
  }
};

const solicitarPrestamo = async (req, res) => {
  try {
    const { numeroCuenta, monto, plazo } = req.body;
    const connection = await getConnection();

    const consultaPrestamoActivo = `
  SELECT COUNT(*) AS totalPrestamos 
  FROM prestamos 
  WHERE numero_cuenta = '${numeroCuenta}' AND estado = 'aprobado'
`;
    const [resultado] = await connection.query(consultaPrestamoActivo);

    if (resultado[0].totalPrestamos > 0) {
      return res.json({
        success: false,
        message: 'El usuario ya tiene un préstamo activo. No se puede solicitar otro.',
      });
    }

    const actualizarSaldo = `UPDATE usuarios SET saldo = saldo + ${monto} WHERE numero_cuenta = '${numeroCuenta}'`;
    await connection.query(actualizarSaldo);

    const registrarPrestamo = `
  INSERT INTO prestamos (numero_cuenta, monto, plazo, estado, fecha_solicitud) 
  VALUES ('${numeroCuenta}', ${monto}, ${plazo}, 'aprobado', NOW())`;
    await connection.query(registrarPrestamo);

    const registrarTransaccion = `
  INSERT INTO transacciones (numero_cuenta, tipo, monto, fecha) 
  VALUES ('${numeroCuenta}', 'desembolso prestamo', ${monto}, NOW())`;
    await connection.query(registrarTransaccion);

    res.json({ success: true, message: 'Prestamo registrado' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la solicitud de prestamo' });
  }
};

const pagarPrestamo = async (req, res) => {
  try {
    const { numeroCuenta, monto } = req.body;
    const connection = await getConnection();

    const consultaDeuda = `SELECT SUM(monto) AS totalDeuda FROM prestamos 
    WHERE numero_cuenta = '${numeroCuenta}' AND estado = 'aprobado'`;
    const [resultadoDeuda] = await connection.query(consultaDeuda);
    const totalDeuda = resultadoDeuda[0].totalDeuda || 0;

    if (monto > totalDeuda) {
      return res.json({ success: false, message: 'El monto a pagar no puede ser mayor que la deuda total.' });
    }

    const consultaSaldo = `SELECT saldo FROM usuarios WHERE numero_cuenta = '${numeroCuenta}'`;
    const [resultadoSaldo] = await connection.query(consultaSaldo);

    if (resultadoSaldo[0].saldo < monto) {
      return res.json({ success: false, message: 'Saldo insuficiente' });
    }

    const actualizarSaldo = `UPDATE usuarios SET saldo = saldo - ${monto} WHERE numero_cuenta = '${numeroCuenta}'`;
    await connection.query(actualizarSaldo);

    const registrarTransaccion = `INSERT INTO transacciones (numero_cuenta, tipo, monto, fecha) 
  VALUES ('${numeroCuenta}', 'pago prestamo', ${monto}, NOW())`;
    await connection.query(registrarTransaccion);

    const nuevoMonto = totalDeuda - monto;

    if (nuevoMonto <= 0) {
      await connection.query(`UPDATE prestamos SET estado = 'cancelado' WHERE numero_cuenta = '${numeroCuenta}'`);
    } else {
      await connection.query(
        `UPDATE prestamos SET monto = ${nuevoMonto} WHERE numero_cuenta = '${numeroCuenta}' AND estado = 'aprobado'`
      );
    }

    res.json({ success: true, message: 'Pago de prestamo realizado con exito' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en la solicitud de prestamo' });
  }
};

const verPrestamos = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const sumaDeudas = `SELECT SUM(monto) AS totalDeuda FROM prestamos 
  WHERE numero_cuenta = '${numeroCuenta}' AND estado = 'aprobado'`;
    const [resultado] = await connection.query(sumaDeudas);

    const totalDeuda = resultado[0].totalDeuda || 0;

    res.json({ success: true, totalDeuda });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en obtener deuda total' });
  }
};

const historicoIngresos = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const ingresos = `
  SELECT * FROM transacciones 
  WHERE (numero_cuenta = '${numeroCuenta}' AND tipo = 'deposito') 
     OR (numero_cuenta_destino = '${numeroCuenta}' AND tipo = 'transferencia') 
     OR (numero_cuenta = '${numeroCuenta}' AND tipo = 'desembolso prestamo')`;
    const [resultado] = await connection.query(ingresos);

    res.json(resultado);
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en obtener el historico de ingresos' });
  }
};

const historicoEgresos = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const egresos = `
  SELECT * FROM transacciones 
  WHERE numero_cuenta = '${numeroCuenta}' AND tipo IN ('retiro', 'transferencia', 'pago prestamo')`;
    const [resultado] = await connection.query(egresos);

    res.json(resultado);
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en obtener el historico de egresos' });
  }
};

const historicoDeudas = async (req, res) => {
  try {
    const { numeroCuenta } = req.body;
    const connection = await getConnection();

    const deudas = `
  SELECT * FROM prestamos 
  WHERE numero_cuenta = '${numeroCuenta}'`;
    const [resultado] = await connection.query(deudas);

    res.json(resultado);
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error en obtener el historico de deudas' });
  }
};

export const methodsallinfo = {
  getBancoall,
  loginUser,
  registroUsuario,
  transferir,
  depositar,
  retirar,
  solicitarPrestamo,
  pagarPrestamo,
  verPrestamos,
  historicoIngresos,
  historicoEgresos,
  historicoDeudas,
  saldo,
  historicoTransferencias,
};
