import { StyleSheet } from 'react-native';
import Colors from '../../constants/Color';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary_background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logo: {
        width: 100,
        height: 100,
        marginBottom: 10
    },
    
    text: {
        fontSize: 28, 
        color: Colors.primary_text,  
    }
});