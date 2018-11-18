import SparkMD5 from 'spark-md5'
import ElementUI from 'element-ui'

/**
 * 计算文件md5值
 * @param file
 * @param that
 * @constructor
 */
export default function GetFileMD5 (file, that) {
  let md5 = null;
  let fileReader = new FileReader()
  let blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;

  let fileSize = file.size;
  let fileRealName = file.name;
  let lastModifiedDate = file.lastModifiedDate;
  if (fileSize > 1024 * 1024 * 500) {
    ElementUI.Notification.error({
      title: 'error',
      message: '文件过大，请重新选择',
      duration: 2000
    });
    return;
  }
  let chunkSize = 2097152;
  // read in chunks of 2MB
  let chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let spark = new SparkMD5();

  fileReader.onload = function (e) {
    // console.log("read chunk nr", currentChunk + 1, "of", chunks);
    spark.appendBinary(e.target.result); // append binary string
    currentChunk++;

    if (currentChunk < chunks) {
      loadNext();
    } else {
      // console.log("finished loading");
      md5 = spark.end();
      // console.info("computed hash", md5); // compute hash
      console.log(md5)
      if (md5) {
        that.$store.commit('storeFile', {md5, fileSize, fileRealName, lastModifiedDate})
      }
    }
  };
  function loadNext () {
    let start = currentChunk * chunkSize
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsBinaryString(blobSlice.call(file, start, end));
  }
  loadNext();
}
