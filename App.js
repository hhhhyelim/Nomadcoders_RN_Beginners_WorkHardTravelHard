import React,{useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet,
  Text,
  View, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY="@toDos";

export default function App() {
  const [working, setWorking] = useState(true); // 1. work에 있는지 없는지 알려주는 state true: working 상태
  const [text, setText] = useState(""); // 2. state에 유저가 쓴 텍스트를 저장해야 함
  const [toDos, setTodos] = useState({});// 3. toDo를 위한 state 많은 사람들이 [] array를 넣는데 이것도 좋지만 우리는 object 사용

  // 1. 두가지 함수 만들기 travel, work
  const travel = () => setWorking(false); // travel을 호출하면 setWorking(false);
  const work = () => setWorking(true); // work를 호출하면 setWorking(true);
  
  // 2. 유저가 뭔가 입력하면 setText 실행하도록 만듦
  const onChangeText= (payload) => setText(payload);

   // 4. 저장
   const saveToDos = async (toSave) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
   };

   // 5. 로드
   const loadToDos = async() => {
    try{
      const s = await AsyncStorage.getItem(STORAGE_KEY);
       // parse는 string을 js object로 만들어줌
       console.log(s);
       s !== null ? setTodos(JSON.parse(s)) : null;
       
    }catch(e){
      // saving error
    }
      
   };
   useEffect(() => {
    loadToDos();
   }, []);

  // 3. 글 쓰고 return 버튼 누르면 감지하는 함수
  const addToDo = async () => {
    // todo가 비었는지 안비었으면 rturn
    if(text == ""){
      return
    } 
    /*
    // 우리는 toDo를 변형시키지 않고 새로운 toDos를 만들거야
    // 3개의 object를 연결시켜주기 위해 object assign 사용
    // target은 새로 만들어n질 object, source는 이전 toDos와 newToDo 넣어주고,
    // key는 Date.now()로 하고 같은 구조로 만들어주면 돼 text는 state로 있는 text, work에는 work의 todo인지 아닌지 넣어줌
    const newToDos = Object.assign(
      {}, // 비어있는 object 결합 :  target object
      toDos,  // 이전 todo를 새로운 todo와 합침
      {[Date.now()]: {text, work:working}, } // 
    ); 
    */
    // object.asign어려우면 이 방법 쓰면 돼 ES6
    // 새로운 object를 만들고  ... 넣어야지 그 오브젝트 내용 받을 수있어
    const newToDos = {
      ...toDos,
      [Date.now()]: {text, working},
    }; 
    setTodos(newToDos);
    await saveToDos(newToDos);
    setText("");
   
  }

  // 6. 삭제
  const deleteToDo = async (key) => {
    Alert.alert(
      "Delete To Do", 
      "Are you sure?", [
      { text:"Cancel"},
      { 
        text: "I'm Sure", 
        onPress: async() => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setTodos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
    
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white": "grey"}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText,  color: !working ? "white": "grey"}}>Travel</Text>
        </TouchableOpacity>        
      </View>
      <View>
        <TextInput 
          returnKeyType="done"
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          value={text}
          placeholder={working? "Add a To Do": "Where do you want to go?"}
          style={styles.input} />
          <ScrollView>{Object.keys(toDos).map(key => 
            toDos[key].working === working? <View style= {styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={()=>deleteToDo(key)}>
                <FontAwesome name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View> : null
            )} 
          </ScrollView> 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText:{
    fontSize: 40,
    fontWeight: "600",
  }, 
  input: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "grey",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 요소들 양 끝에 
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  }

});
