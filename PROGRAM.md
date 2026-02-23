# 다오콘 2026 프로그램

## 세션 목록

1. (10:00 - 10:10) [웰컴] From AI to WE: 연결이 만드는 미래의 일
2. (10:10 - 10:40) [기조연설] 경량문명 시대 연결의 가치
3. (10:40 - 11:10) [강연] 커뮤니티 1.0에서 4.0까지 총정리
4. (11:10 - 11:50) [패널] 커뮤니티는 어떻게 나의 삶과 일을 변화시켰는가?
5. (11:50 - 12:10) [인터랙티브] Community Map: From Data to Connection
6. (13:30 - 14:00) [강연] 커뮤니티를 '이벤트'가 아닌 '일상'으로 만들기
7. (14:00 - 14:30) [강연] 커뮤니티, 브랜드의 등대가 되다 - BAC 사례
8. (14:30 - 15:10) [패널] 고객 경험의 미래: 고객 커뮤니티에서 답을 찾다
9. (15:30 - 16:00) [강연] 소속감의 시대: 왜 '직장'이 아니라 '길드'인가?
10. (16:00 - 16:40) [패널] 커뮤니티의 진화 - 일과 조직을 바꾸다
11. (16:40 - 17:00) [인터랙티브] 오픈 마이크 <우리 커뮤니티를 소개합니다>
12. (17:00 - 17:30) [클로징] 다오랩, 커뮤니티형 자율조직을 꿈꾸다

## 초기화 방법

```bash
# 프로젝트 루트 디렉토리에서
sqlite3 database.db << 'EOF'
DELETE FROM sessions;
INSERT INTO sessions (id, title) VALUES ('1', '(10:00 - 10:10) [웰컴] From AI to WE: 연결이 만드는 미래의 일');
INSERT INTO sessions (id, title) VALUES ('2', '(10:10 - 10:40) [기조연설] 경량문명 시대 연결의 가치');
INSERT INTO sessions (id, title) VALUES ('3', '(10:40 - 11:10) [강연] 커뮤니티 1.0에서 4.0까지 총정리');
INSERT INTO sessions (id, title) VALUES ('4', '(11:10 - 11:50) [패널] 커뮤니티는 어떻게 나의 삶과 일을 변화시켰는가?');
INSERT INTO sessions (id, title) VALUES ('5', '(11:50 - 12:10) [인터랙티브] Community Map: From Data to Connection');
INSERT INTO sessions (id, title) VALUES ('6', '(13:30 - 14:00) [강연] 커뮤니티를 ''이벤트''가 아닌 ''일상''으로 만들기');
INSERT INTO sessions (id, title) VALUES ('7', '(14:00 - 14:30) [강연] 커뮤니티, 브랜드의 등대가 되다 - BAC 사례');
INSERT INTO sessions (id, title) VALUES ('8', '(14:30 - 15:10) [패널] 고객 경험의 미래: 고객 커뮤니티에서 답을 찾다');
INSERT INTO sessions (id, title) VALUES ('9', '(15:30 - 16:00) [강연] 소속감의 시대: 왜 ''직장''이 아니라 ''길드''인가?');
INSERT INTO sessions (id, title) VALUES ('10', '(16:00 - 16:40) [패널] 커뮤니티의 진화 - 일과 조직을 바꾸다');
INSERT INTO sessions (id, title) VALUES ('11', '(16:40 - 17:00) [인터랙티브] 오픈 마이크 <우리 커뮤니티를 소개합니다>');
INSERT INTO sessions (id, title) VALUES ('12', '(17:00 - 17:30) [클로징] 다오랩, 커뮤니티형 자율조직을 꿈꾸다');
EOF
```
