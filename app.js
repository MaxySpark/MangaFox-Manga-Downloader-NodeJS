var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var argv = require('yargs').option({
    name : {
        demand : true,
        alias:[ 'n'],
        description: "Name Of The Manga",
        type: 'string'
    },
    chapter : {
        demand : true,
        alias:[ 'ch','c','cn'],
        description: "Number Of The Manga Chapter",
        type: 'number'
    }
}).help('help').alias('help','h').argv;

var i,a=0,b=0,c=0;
var images = [], volumes= [], main_list = [];
var nextUrl;
var manga = argv.name.toLowerCase();
var mangaName = manga.replace(/ /g, "_");
var urlMain = "http://mangafox.me/manga/"+mangaName+"/";
request({
    url: urlMain
},(err, res, body) => {
    if(err) throw err;
    
    else {
        var $ = cheerio.load(body);
        var vn = 0;
        var volume_data = [],titles = [];
        var tn = 0;

        $(".volume").each(function() {
            var volume = $(this).html();
            volume = volume.replace(/<.*>/,"").replace("Volume ","v");
            volumes.push(volume);
        });
        
        $(".title").each(function(){
            var title = $(this).html();
            titles.push(title);
        });
         c = $("a.tips").length;
        $('.chlist').each(function() {
            var  chapters = [];
           
            $(this).find("a.tips").each(function () {
                var chapterName =  $(this).html();
                chapterN = chapterName.toLowerCase();
                chapterN = chapterN.replace(manga+' ',"");
                chapterN = parseInt(chapterN);
                if(chapterN<10) {
                    chapterN="c00"+chapterN;
                }
                else if(chapterN>10 && chapterN<100 ){
                    chapterN = "c0"+chapterN;
                }
                else if(chapterN>100 && chapterN<1000) {
                    chapterN = "c"+chapterN;
                }
                var data = {
                    id : c--,
                    url : $(this).attr('href'),
                    volume_name: volumes[vn],
                    chapter : chapterN,
                    chapter_name : chapterName,
                    chapter_title : titles[tn]
                };
                tn++;
                chapters.push(data);   
                main_list.push(data);
            });

            chapters.reverse();
            
            var chapter_list = {
                
                ch_length : $(this).find('.tips').length,
                ch_data : chapters
            }
            volume_data.push(chapter_list);
            vn++;
        });
        
        volumes.reverse();
        volume_data.reverse();
        main_list.reverse();

        // console.log(main_list);
        // volume_data.forEach(function(element) {
        //     for(i=0;i<element.ch_data.length;i++){
        //     console.log('('+element.ch_data[i].id+') '+element.ch_data[i].chapter_name);
        // }
        // });

        main_list.forEach(function(element) {
            console.log('('+element.id+') '+element.chapter_name);
        });
        
        download(main_list[argv.c + 1]);
       
    }
});
function download(mangaObj) {
    
    var Volume = mangaObj.volume_name;
    var Chapter = mangaObj.chapter;
    var dir = "./"+mangaObj.chapter_name+' ('+mangaObj.chapter_title+')'; 
    var downloadDir = mangaObj.chapter_name+' ('+mangaObj.chapter_title+')';
    var Furl = mangaObj.url;
    readNextRequest(Furl);    

    function readNextRequest(url) {
        request({
            url: url,
            gzip: true,
            json: true
        },
        (err,res,body) => {
            if(err) throw err;
            else {
                var $ = cheerio.load(body);
                // console.log(++b);
                $(".read_img > a > img").each(function() {
                    var img_link = $(this).attr('src');
                    images.push(img_link);
                    
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    request(img_link).pipe(fs.createWriteStream(downloadDir+'/'+((a++)+1)+'.jpg')).on('finish', function(response) {         
                        console.log("Download Completed : "+(++b));
                        });
                });
                $(".read_img > a").each(function() {
                    nextUrl = $(this).attr('href');
                    // console.log(nextUrl);
                })           
                if(nextUrl != "javascript:void(0);") {
                    nextUrl = urlMain + Volume +'/'+Chapter+'/'+nextUrl;
                    readNextRequest(nextUrl);
                } else {
                    // downloadLoop(images);
                    console.log('Completed');
                }
                
            }
        });
    }

    function downloadLoop(urls) {
        for(i=0;i<urls.length;i++){
            request(urls[i]).pipe(fs.createWriteStream('Chapter_0/'+(i+1)+'.jpg')).on('finish', function(response) {         
                console.log("Download Completed : "+(++b)+'/'+i);
                });
            
        }
    }
}