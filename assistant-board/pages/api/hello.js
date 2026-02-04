export default (req, res) => {
  res.json({ message: 'Hello', method: req.method });
};