
import scala.concurrent.duration._
import scala.util.Random

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

import java.net.URLDecoder

class JatosAppendSimulation extends Simulation {

  val httpProtocol = http
//    .baseUrl("https://jatos.mindprobe.eu")
//    .wsBaseUrl("wss://jatos.mindprobe.eu")
    .baseUrl("http://188.166.163.154")
    .wsBaseUrl("ws://188.166.163.154")
//    .baseUrl("http://127.0.0.1:9000")
//    .wsBaseUrl("ws://127.0.0.1:9000")
    .inferHtmlResources()
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .doNotTrackHeader("1")
    .userAgentHeader("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0")

  val header_html = Map(
    "Accept" -> "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Upgrade-Insecure-Requests" -> "1")

  val header_json = Map(
    "Accept" -> "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With" -> "XMLHttpRequest")

  val header_text = Map("Content-Type" -> "text/plain")

  val header_ajax = Map(
    "Content-Type" -> "text/plain; charset=UTF-8",
    "X-Requested-With" -> "XMLHttpRequest")



  val scn = scenario("JatosDefaultSimulation")
    .exec(session => session.set("batchId", "1"))
    .exec(session => session.set("studyId", "1"))
    .exec(session => session.set("componentId1", "1"))
    .exec(session => session.set("componentId2", "2"))

// ### 1. Component ###
  .exec(
    http("Start").get("/publix/${studyId}/start?batchId=${batchId}&generalMultiple").check(bodyString.saveAs("BODY")).headers(header_html)
  ).exec(getCookieValue(CookieKey("JATOS_IDS_0"))
  ).exec(session => {
    val cookie = session("JATOS_IDS_0").as[String]
    val cookieParas = parseUrlParameters(cookie)
    val studyResultId = cookieParas("studyResultId")
    println(s"JATOS_IDS_0: ${studyResultId}")
    session.set("studyResultId", studyResultId)
  }).exec(
    http("Get init data").get("/publix/${studyId}/${componentId1}/initData?srid=${studyResultId}").headers(header_json)
  ).exec(
    ws("Open batch channel").wsName("batchChannel").connect("/publix/${studyId}/batch/open?srid=${studyResultId}")
  ).exec(
    http("Heartbeat").post("/publix/${studyId}/heartbeat?srid=${studyResultId}").headers(header_text)
  ).exec(
    ws("Join group").wsName("groupChannel").connect("/publix/${studyId}/group/join?srid=${studyResultId}")
  ).exec(
    http("Post study session data").post("/publix/${studyId}/studySessionData?srid=${studyResultId}").headers(header_ajax).body(StringBody("""{"foo":"bar"}"""))
  ).repeat(500) {
	pause(500 milliseconds).exec(
        	http("Append result").post("/publix/${studyId}/${componentId1}/resultData?srid=${studyResultId}").headers(header_ajax).body(StringBody(Random.alphanumeric.take(10000).mkString("")))
	)
    }
  .exec(ws("Close batch channel").wsName("batchChannel").close
  ).exec(ws("Close group channel").wsName("groupChannel").close)

// ### 2. Component ###
  .exec(
    http("Next component").get("/publix/${studyId}/${componentId2}/start?srid=${studyResultId}&message=load%20test%20message%20%C2%A7%24%25%26").headers(header_html)
  ).exec(
    http("Get init data").get("/publix/${studyId}/${componentId2}/initData?srid=${studyResultId}").headers(header_json)
  ).pause(1 seconds).exec(
    ws("Open batch channel").wsName("batchChannel").connect("/publix/${studyId}/batch/open?srid=${studyResultId}")
  ).exec(
    http("Heartbeat").post("/publix/${studyId}/heartbeat?srid=${studyResultId}").headers(header_text)
  ).pause(1 seconds).exec(
    ws("Join group").wsName("groupChannel").connect("/publix/${studyId}/group/join?srid=${studyResultId}")
  ).pause(1 seconds).exec(
    http("Post result").post("/publix/${studyId}/${componentId2}/resultData?srid=${studyResultId}").headers(header_ajax).body(StringBody(Random.alphanumeric.take(5000000).mkString("")))
  ).pause(1 seconds).exec(
    http("Leave group").get("/publix/${studyId}/group/leave?srid=${studyResultId}").headers(header_ajax)
  ).pause(1 seconds).exec(
    http("Post study session data").post("/publix/${studyId}/studySessionData?srid=${studyResultId}").headers(header_json).body(StringBody("""{"foo":"bar"}"""))
  ).exec(
    http("Finish study").get("/publix/${studyId}/end?srid=${studyResultId}").headers(header_ajax)
  ).exec(ws("Close batch channel").wsName("batchChannel").close)

  def parseUrlParameters(url: String) = {
    url.split("&").map(v => {
      val m = v.split("=", 2).map(s => URLDecoder.decode(s, "UTF-8"))
      m(0) -> m(1)
    }).toMap
  }

//  setUp(scn.inject(atOnceUsers(1))).protocols(httpProtocol)
  setUp(scn.inject(rampUsersPerSec(0.2) to (1.0) during (600 seconds))).protocols(httpProtocol)
//  setUp(scn.inject(constantConcurrentUsers(20) during (6000 seconds))).protocols(httpProtocol)
//  setUp(scn.inject(rampConcurrentUsers(0) to (100) during (600 seconds))).protocols(httpProtocol)
}

