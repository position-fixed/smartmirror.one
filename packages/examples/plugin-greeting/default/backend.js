module.exports = {
  beforeLoad() {
    console.log('Plugin beforeLoad');
  },
  onLoad() {
    console.log('Plugin onLoad');
  },
  update() {
    console.log(`The 'update' method has been triggered for the example plugin.`);
    const now = new Date().getHours();
    if (now > 18) return 'Good evening';
    if (now > 12) return 'Good afternoon';
    if (now > 6) return 'Good morning';
    return 'Good night';
  }
}