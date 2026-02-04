module.exports = (req, res) => {
  res.status(200).json({ working: true, time: new Date().toISOString() });
};