const { makeArticlesOnce } = require('../generator');
module.exports = async (req, res) => {
  try {
    const secret = process.env.GENERATE_SECRET;
    if (secret && req.query.secret !== secret) {
      return res.status(401).send('Unauthorized');
    }
    // Run generator once
    await makeArticlesOnce();
    return res.status(200).json({ ok: true, message: 'Generated articles' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
