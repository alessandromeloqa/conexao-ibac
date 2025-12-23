export const atualizarParticipacao = async (req, res) => {
  const { id } = req.params;
  const { tema } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE participacoes SET tema = $1 WHERE id = $2 RETURNING *',
      [tema, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
